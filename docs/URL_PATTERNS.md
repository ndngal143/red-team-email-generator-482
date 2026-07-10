# Internal-Looking Training URL Patterns

These URL formats are for authorized security awareness demos only. They always use the configured safe demo domain, which defaults to `training.example.internal`, and they do not point to credential collection pages.

| Category | Pattern | Sample generated link |
| --- | --- | --- |
| Finance | `https://training.example.internal/finance/reimbursements/{scenario}?ref=awareness-{token}` | `https://training.example.internal/finance/reimbursements/recent-reimbursement-policy-change?ref=awareness-0001` |
| Finance | `https://training.example.internal/finance/policies/{scenario}/acknowledge?case=training-{token}` | `https://training.example.internal/finance/policies/recent-reimbursement-policy-change/acknowledge?case=training-0002` |
| Payroll | `https://training.example.internal/payroll/documents/{scenario}?notice=demo-{token}` | `https://training.example.internal/payroll/documents/recent-reimbursement-policy-change?notice=demo-0003` |
| HR | `https://training.example.internal/hr/benefits/{scenario}?ref=awareness-{token}` | `https://training.example.internal/hr/benefits/recent-reimbursement-policy-change?ref=awareness-0004` |
| HR | `https://training.example.internal/people/policies/{scenario}/review?ticket=training-{token}` | `https://training.example.internal/people/policies/recent-reimbursement-policy-change/review?ticket=training-0005` |
| HR | `https://training.example.internal/hr/forms/{scenario}?source=demo-{token}` | `https://training.example.internal/hr/forms/recent-reimbursement-policy-change?source=demo-0006` |
| IT | `https://training.example.internal/it/service-desk/{scenario}?ticket=awareness-{token}` | `https://training.example.internal/it/service-desk/recent-reimbursement-policy-change?ticket=awareness-0007` |
| IT | `https://training.example.internal/security/device-review/{scenario}?ref=training-{token}` | `https://training.example.internal/security/device-review/recent-reimbursement-policy-change?ref=training-0008` |
| IT | `https://training.example.internal/it/account-notices/{scenario}?notice=demo-{token}` | `https://training.example.internal/it/account-notices/recent-reimbursement-policy-change?notice=demo-0009` |
| Operations | `https://training.example.internal/operations/schedules/{scenario}?ref=awareness-{token}` | `https://training.example.internal/operations/schedules/recent-reimbursement-policy-change?ref=awareness-0010` |
| Facilities | `https://training.example.internal/facilities/access/{scenario}?case=training-{token}` | `https://training.example.internal/facilities/access/recent-reimbursement-policy-change?case=training-0011` |
| Policy | `https://training.example.internal/intranet/policy-notices/{scenario}?ref=awareness-{token}` | `https://training.example.internal/intranet/policy-notices/recent-reimbursement-policy-change?ref=awareness-0012` |
| Training | `https://training.example.internal/portal/training/{scenario}?session=demo-{token}` | `https://training.example.internal/portal/training/recent-reimbursement-policy-change?session=demo-0013` |
| Compliance | `https://training.example.internal/compliance/review/{scenario}?case=awareness-{token}` | `https://training.example.internal/compliance/review/recent-reimbursement-policy-change?case=awareness-0014` |

## Selection Rules

- Finance and accounting departments use finance and payroll patterns.
- HR and human resources departments use benefits, people policy, and forms patterns.
- IT and security departments use service desk, device review, and account notice patterns.
- Operations and facilities departments use schedule and access patterns.
- Other departments use intranet, training, and compliance patterns.

`{scenario}` is a lowercase URL-safe version of the scenario context, and `{token}` is a short random training identifier.
