# Infrastructure as Code (Terraform)

This directory contains Terraform configurations for deploying the Innovation Lab platform to AWS.

## Structure

```
infra/
├── modules/               # Reusable Terraform modules
│   ├── vpc/              # VPC networking
│   ├── rds/              # PostgreSQL RDS
│   ├── redis/            # ElastiCache Redis
│   ├── s3/               # S3 buckets + CloudFront
│   ├── ecs/              # ECS Fargate services
│   └── waf/              # Web Application Firewall
├── environments/         # Environment-specific configs
│   ├── dev/
│   ├── staging/
│   └── prod/
└── README.md            # This file
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured (`aws configure`)
3. **Terraform** >= 1.5.0 installed
4. **GitHub OIDC** configured for CI/CD

## AWS Services Used (All Free Tier Compatible for Development)

- **VPC** - Virtual Private Cloud (Free)
- **RDS** - PostgreSQL database (Free tier: db.t3.micro, 20GB)
- **ElastiCache** - Redis (Free tier: cache.t3.micro)
- **S3** - Object storage (Free tier: 5GB)
- **CloudFront** - CDN (Free tier: 1TB/month)
- **ECS Fargate** - Container orchestration (Free tier: Limited usage)
- **AWS App Runner** - Alternative simpler deployment (Pay as you go, but cheaper for small apps)
- **Route53** - DNS ($0.50/month per hosted zone)
- **ACM** - TLS certificates (Free)
- **ALB** - Application Load Balancer ($16-20/month - **Not free**)
- **WAF** - Web Application Firewall (Pay as you go)

## Cost-Free Alternative for Development

For a **completely free** development setup, use:

1. **Local Docker Compose** (already provided in `docker-compose.yml`)
2. **Railway.app** or **Render.com** for free hosting:
   - Free PostgreSQL database (512MB)
   - Free Redis instance
   - Free web service deployment
   - Free SSL certificates
3. **Cloudflare Pages** for Next.js (Free unlimited)
4. **Supabase** for free PostgreSQL (500MB database, 1GB file storage)

## Deployment Options

### Option 1: Local Development (100% Free)

```bash
# Use Docker Compose (already configured)
cd ../
pnpm docker:up
pnpm dev
```

### Option 2: Free Cloud Hosting (Railway/Render)

**Railway.app** (Recommended for free tier):

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Deploy API
cd apps/api
railway up

# Deploy Web (use Vercel/Cloudflare Pages instead)
```

**Render.com**:
1. Connect GitHub repository
2. Create PostgreSQL database (Free 90 days)
3. Create Redis instance (Free 90 days)
4. Create Web Service for API
5. Create Static Site for Next.js

### Option 3: AWS (Production - Costs Apply)

#### Step 1: Initialize Terraform

```bash
cd environments/prod
terraform init
```

#### Step 2: Configure Variables

Create `terraform.tfvars`:

```hcl
project_name = "innovation-lab"
environment  = "prod"
aws_region   = "us-east-1"

# Database
db_instance_class = "db.t3.micro"  # Free tier
db_allocated_storage = 20          # Free tier
db_name = "innovationlab"
db_username = "dbadmin"

# Redis
redis_node_type = "cache.t3.micro"  # Free tier

# Domain (optional)
domain_name = "innovationlab.example.com"

# Tags
tags = {
  Project     = "Innovation Lab"
  Environment = "production"
  ManagedBy   = "Terraform"
}
```

#### Step 3: Plan and Apply

```bash
# Review what will be created
terraform plan

# Apply the configuration
terraform apply

# Save outputs
terraform output > outputs.txt
```

#### Step 4: Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `AWS_ACCOUNT_ID`
- `AWS_REGION`
- `DATABASE_URL` (from Terraform output)
- `REDIS_URL` (from Terraform output)
- `S3_BUCKET_NAME` (from Terraform output)
- `CLOUDFRONT_DISTRIBUTION_ID` (from Terraform output)

#### Step 5: Deploy via CI/CD

Push to `main` branch to trigger automatic deployment.

## Free Tier Limits (AWS)

**RDS PostgreSQL (Free Tier):**
- 750 hours/month of db.t3.micro
- 20 GB storage
- 20 GB backups
- **Duration:** 12 months

**ElastiCache Redis (Free Tier):**
- 750 hours/month of cache.t3.micro
- **Duration:** 12 months

**S3 (Free Tier):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- **Duration:** Always free

**ECS Fargate (Free Tier):**
- Limited free usage
- Typically $5-20/month for small apps

**CloudFront (Free Tier):**
- 1 TB data transfer out
- 10 million requests
- **Duration:** Always free

## Cost Optimization Tips

1. **Use AWS App Runner instead of ECS + ALB**
   - Saves ~$20/month (no ALB needed)
   - Simpler deployment
   - Auto-scaling included

2. **Use Cloudflare for free CDN**
   - Free SSL
   - Free DDoS protection
   - Free CDN

3. **Use managed services (Railway/Render/Supabase)**
   - Free tiers available
   - No infrastructure management
   - Perfect for development/staging

4. **Enable AWS Cost Explorer**
   - Monitor spending
   - Set billing alerts

## Destroying Infrastructure

```bash
cd environments/prod
terraform destroy
```

**Warning:** This will delete all resources and data!

## Module Documentation

Each module has its own README with detailed configuration options:

- [VPC Module](./modules/vpc/README.md)
- [RDS Module](./modules/rds/README.md)
- [Redis Module](./modules/redis/README.md)
- [S3 Module](./modules/s3/README.md)
- [ECS Module](./modules/ecs/README.md)

## Security Best Practices

1. **Never commit secrets** - Use AWS Secrets Manager or Parameter Store
2. **Enable encryption** - All data at rest and in transit
3. **Least privilege IAM** - Minimal permissions required
4. **Enable WAF** - Protect against common attacks
5. **Regular backups** - Automated RDS snapshots
6. **VPC Security Groups** - Restrict network access
7. **Enable CloudTrail** - Audit all API calls

## Troubleshooting

### Common Issues

**1. Terraform state locked**
```bash
terraform force-unlock <LOCK_ID>
```

**2. Provider version conflicts**
```bash
terraform init -upgrade
```

**3. Resource already exists**
```bash
terraform import <resource_type>.<name> <resource_id>
```

## Support

For infrastructure issues:
- GitHub Issues: https://github.com/mickelsamuel/Innovation-Lab/issues
- AWS Support: https://console.aws.amazon.com/support/
- Terraform Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
