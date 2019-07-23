const fs = require("fs");
const yaml = require("js-yaml");
const _ = require("lodash");

const AWS = "aws";
const OFFLINE_YAML = "offline.yml";
const SSM = "SSM";

class ServerlessOfflineSSMProvider {
    constructor(serverless) {
        this.serverless = serverless;
        const commands = serverless.providers.aws;

        const isOffline = commands && _.get(commands, 'options.offline', false);

        if (!isOffline) {
            return;
        }

        try {
            this.ssm = this.getOfflineSsmParameters();
        } catch (err) {
            throw new Error(`Unable to parse ${OFFLINE_YAML}: ${err}`);
        }

        this.overrideAws();
    }

    getOfflineSsmParameters() {
        if (!fs.existsSync(OFFLINE_YAML)) {
            throw new Error(`${OFFLINE_YAML} does not exist`);
        }
        const doc = yaml.safeLoad(fs.readFileSync(OFFLINE_YAML, "utf8"));
        return doc.ssm;
    }

    overrideAws() {
        const aws = this.serverless.getProvider(AWS);
        const request = aws.request.bind(aws);

        aws.request = (service, method, params, options) => {
            if (service !== SSM || method !== "getParameter") {
                return request(service, method, params, options);
            }

            const { Name } = params;
            const Value = this.ssm[Name];

            if (!Value) {
                return Promise.reject(new Error(`SSM parameter ${Name} not found in ${OFFLINE_YAML}`));
            }

            return Promise.resolve({
                Parameter: {
                    Value
                }
            });
        };

        this.serverless.setProvider(AWS, aws);
        return "foo";
    }
}

module.exports = ServerlessOfflineSSMProvider;
