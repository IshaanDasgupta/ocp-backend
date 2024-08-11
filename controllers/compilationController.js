import { execSync } from "child_process";
import { Submission } from "../models/Submission.js";
import createError from "http-errors";
import fs from "fs";

const decodeBase64 = (base64String) => {
    if (!base64String) {
        throw new Error("Base64 string is undefined or empty");
    }
    try {
        console.log(`Base64 String Length: ${base64String.length}`);
        
        if (base64String.length % 4 !== 0) {
            base64String = base64String.padEnd(base64String.length + (4 - base64String.length % 4), '=');
        }

        return execSync(
            `powershell -command "[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64String}'))"`
        ).toString();
    } catch (err) {
        throw new Error(`Base64 decoding failed: ${err.message}`);
    }
};

export const cppCompilation = async (req, res, next) => {
    try {
        const submission_id = req.body.submission_id;
        console.log(submission_id);
        let submission = await Submission.findById(submission_id);

        if (!submission) {
            return next(createError(400, "Invalid submission"));
        }
        let decodedCode;
        try {
            decodedCode = decodeBase64(submission.code);
        } catch (err) {
            return next(createError(400, `Base64 decoding of submission code failed: ${err.message}`));
        }

        decodedCode = decodedCode
            .replace(/[^\x20-\x7E\n\r]/g, '')
            .replace(/(\r\n|\n|\r)/g, '\n')
            .trim();

        fs.writeFileSync(`./files/${submission_id}.cpp`, decodedCode);

        execSync(`g++ -mconsole -o .\\files\\${submission_id}.exe .\\files\\${submission_id}.cpp`);

        let total_score = 0;
        console.log(submission.test_cases);
        submission.test_cases.forEach((data, index) => {
            try {
                const test_case = data.test_case;

                console.log(`Test Case ${index}:`, test_case);

                let inputTestCase;
                try {
                    inputTestCase = decodeBase64(test_case.input);
                } catch (err) {
                    return next(createError(400, `Base64 decoding for input test case ${index} failed: ${err.message}`));
                }
                inputTestCase = inputTestCase.replace(/[^\x20-\x7E]/g, '');
                fs.writeFileSync(`./files/${submission_id}-input.txt`, inputTestCase);

                // Run the compiled file with the test case input
                const output = execSync(`.\\files\\${submission_id}.exe < .\\files\\${submission_id}-input.txt`)
                    .toString()
                    .trim();

                // Decode and clean the expected output
                let expectedOutput;
                // console.log(test_case.expected_output);
                try {
                    expectedOutput = decodeBase64(test_case.expected_output);
                } catch (err) {
                    return next(createError(400, `Base64 decoding for expected output ${index} failed: ${err.message}`));
                }
                expectedOutput = expectedOutput.replace(/[^\x20-\x7E]/g, '');

                if (output === expectedOutput.trim()) {
                    submission.test_cases[index].passed = true;
                    total_score += submission.test_cases[index].score;
                } else {
                    submission.test_cases[index].passed = false;
                }
            } catch (err) {
                return next(
                    createError(
                        500,
                        `Test case ${index} failed with message ${err.toString()} `
                    )
                );
            }
        });

        execSync(
            `del /Q .\\files\\${submission_id}.exe && del /Q .\\files\\${submission_id}.cpp && del /Q .\\files\\${submission_id}-input.txt`
        );

        submission.total_score = total_score;
        await Submission.findByIdAndUpdate(submission_id, submission);

        res.status(200).send("Compilation and execution completed successfully");
    } catch (err) {
        next(err);
    }
};




export const javaCompilation = async (req, res, next) => {
    try {
        const submission_id = req.body._id;
        let submission = await Submission.findById(submission_id);

        if (!submission) {
            return next(createError(400, "invalid submission"));
        }
        execSync(
            `echo ${submission.code} | base64 --decode > ./files/${submission_id}.java && javac ./files/${submission_id}.java`
        );

        submission.test_cases.forEach((data, index) => {
            try {
                const test_case = data.test_case;
                execSync(
                    `echo ${test_case.input} | base64 --decode > ./files/${submission_id}-input.txt `
                );
                const output = execSync(
                    `java ./files/${submission_id} < ./files/${submission_id}-input.txt`
                )
                    .toString()
                    .trim();

                const testcase_output = execSync(
                    `echo ${test_case.output} | base64 --decode`
                )
                    .toString()
                    .trim();

                if (output == testcase_output) {
                    submission.test_cases[index].passed = true;
                    total_score += submission.test_cases[index].score;
                } else {
                    submission.test_cases[index].passed = false;
                }
            } catch (err) {
                return next(
                    createError(
                        500,
                        `${index} test case failed with message ${err.toString()} `
                    )
                );
            }
        });

        execSync(
            `rm ./files/${submission_id}.class && rm ./files/${submission_id}.java && rm ./files/${submission_id}-input.txt`
        );

        submission.total_score = total_score;
        await Submission.findByIdAndUpdate(submission_id, submission);

        res.status(200).send("Hello");
    } catch (err) {
        next(err);
    }
};

export const pythonCompilation = async (req, res, next) => {
    try {
        const submission_id = req.body._id;
        let submission = await Submission.findById(submission_id);

        if (!submission) {
            return next(createError(400, "invalid submission"));
        }

        execSync(
            `echo ${submission.code} | base64 --decode > ./files/${submission_id}.py`
        );

        submission.test_cases.forEach((data, index) => {
            try {
                const test_case = data.test_case;

                execSync(
                    `echo ${test_case.input} | base64 --decode > ./files/${submission_id}-input.txt `
                );
                const output = execSync(
                    `./files/${submission_id}.py < ./files/${submission_id}-input.txt`
                )
                    .toString()
                    .trim();

                const testcase_output = execSync(
                    `echo ${test_case.output} | base64 --decode`
                )
                    .toString()
                    .trim();

                if (output == testcase_output) {
                    submission.test_cases[index].passed = true;
                    total_score += submission.test_cases[index].score;
                } else {
                    submission.test_cases[index].passed = false;
                }
            } catch (err) {
                return next(
                    createError(
                        500,
                        `${index} test case failed with message ${err.toString()} `
                    )
                );
            }
        });

        execSync(
            `rm ./files/${submission_id}.py && rm ./files/${submission_id}-input.txt`
        );

        submission.total_score = total_score;
        await Submission.findByIdAndUpdate(submission_id, submission);

        res.status(200).send("Hello");
    } catch (err) {
        next(err);
    }
};
