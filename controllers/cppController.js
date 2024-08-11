import { execSync } from "child_process";
import createError from "http-errors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const decodeBase64 = (base64String) => {
    if (!base64String) {
        throw new Error("Base64 string is undefined or empty");
    }
    try {
        console.log(`Base64 String Length: ${base64String.length}`);
        if (base64String.length % 4 !== 0) {
            base64String = base64String.padEnd(base64String.length + (4 - base64String.length % 4), '=');
        }

        const buffer = Buffer.from(base64String, 'base64');
        const decoded = buffer.toString('utf8');

        console.log(`Decoded String Length: ${decoded.length}`);
        console.log(`Decoded String: ${decoded}`);
        return decoded;
    } catch (err) {
        throw new Error(`Base64 decoding failed: ${err.message}`);
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executeCppCode = async (req, res, next) => {
    try {
        const { codeBase64, testcaseBase64, submission_id } = req.body;

        if (!submission_id) {
            return next(createError(400, "Submission ID is required"));
        }

        let decodedCode, inputTestCase;
        try {
            decodedCode = decodeBase64(codeBase64);
            inputTestCase = decodeBase64(testcaseBase64);
        } catch (err) {
            return next(createError(400, `Base64 decoding failed: ${err.message}`));
        }

        inputTestCase = inputTestCase.replace(/[^\x20-\x7E\n\r]/g, '').replace(/(\r\n|\n|\r)/g, '\n').trim();

        console.log(`Formatted Input Test Case: ${inputTestCase}`);
        
  const cppFilePath = path.join(__dirname, `../files/${submission_id}.cpp`);
  const inputFilePath = path.join(__dirname, `../files/${submission_id}-input.txt`);
  const exeFilePath = path.join(__dirname, `../files/${submission_id}.exe`);

        fs.writeFileSync(cppFilePath, decodedCode);
        fs.writeFileSync(inputFilePath, inputTestCase);

        try {
            execSync(`g++ -o "${exeFilePath}" "${cppFilePath}"`);
        } catch (err) {
            return next(createError(500, `Compilation failed: ${err.stderr.toString() || err.message}`));
        }

        let output;
        try {
            output = execSync(`"${exeFilePath}" < "${inputFilePath}"`).toString().trim();
        } catch (err) {
            return next(createError(500, `Runtime execution failed: ${err.stderr.toString() || err.message}`));
        }

        try {
            fs.unlinkSync(exeFilePath);
            fs.unlinkSync(cppFilePath);
        
        } catch (err) {
            console.error(`File cleanup failed: ${err.message}`);
        }

        res.status(200).json({ output });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        next(createError(500, `An error occurred: ${err.message}`));
    }
};
