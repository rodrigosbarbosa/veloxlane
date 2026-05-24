# AWS Setup — VeloxLane

Recommended starting setup:

- Standard AWS account.
- Default region: `us-east-1` unless founder chooses otherwise.
- No paid support plan required for MVP.

Founder actions:

1. Enable root MFA.
2. Add billing alerts/budgets:
   - $50 monthly alert.
   - $100 monthly alert.
3. Create IAM Identity Center admin user for human access.
4. Do not create Terraform long-lived keys until Hermes requests them for infrastructure work.

Later credentials Hermes will request:

- AWS account ID.
- AWS region.
- Terraform deploy role/user credentials with least privilege.
- S3/CloudFront deployment permissions when file storage work starts.

Security rules:

- Never share root credentials.
- Never paste AWS secret keys into chat if they can be entered directly into a secure secret store.
