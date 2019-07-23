# Serverless Offline SSM Parameter Provider

[Serverless] plugin to resolves SSM paramters (variables) from a local file to
support Serverless offline development.

## Usage

### Install the Plugin

    npm i --save-dev serverless-offline-aws-ssm

or

    yarn add -D serverless-offline-aws-ssm

### Add to Serverless

Add the serverless-offline-aws-ssm before the serverless offline plugin:

```yaml
plugins:
  - serverless-offline-aws-ssm
  - serverless-offline
```

### Define your SSM Parameter Values

This plugin loads SSM parameter values for offline use from a file named
`offline.yml`. This file should exist in the same directory as your
`serverless.yml`.

Parameters are declared in the same way as they're referenced in your
`serverless.yml` file, minus the `ssm:` prefix.

For example:

```yaml
provider:
  name: aws
  environment:
    REDIS_ENDPOINT: ${ssm:/my-service/foo/redis-endpoint}
    SUPER_SECRET:  ${ssm:/path/to/secureparam~true}
```

Your `offline.yml` file should contain:

```yaml
ssm:
    /my-service/foo/redis-endpoint: some-value
    /path/to/secureparam: other-value
```

[Serverless]: https://serverless.com/
