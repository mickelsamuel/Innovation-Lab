terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state storage (optional - comment out for local state)
  # backend "s3" {
  #   bucket         = "innovation-lab-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(var.tags, {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    })
  }
}

# VPC and Networking
module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  cidr_block   = var.vpc_cidr
}

# RDS PostgreSQL Database
module "rds" {
  source = "../../modules/rds"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  database_name         = var.db_name
  master_username       = var.db_username
  backup_retention_days = var.db_backup_retention
  multi_az              = var.environment == "prod"
}

# ElastiCache Redis
module "redis" {
  source = "../../modules/redis"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = var.redis_node_type
  num_cache_nodes    = 1
}

# S3 Bucket and CloudFront CDN
module "s3" {
  source = "../../modules/s3"

  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "${var.project_name}-${var.environment}-assets"
}

# ECS Fargate for API Service
module "ecs_api" {
  source = "../../modules/ecs"

  project_name       = var.project_name
  environment        = var.environment
  service_name       = "api"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  container_image = var.api_container_image
  container_port  = 4000
  cpu             = var.api_cpu
  memory          = var.api_memory
  desired_count   = var.api_desired_count

  environment_variables = {
    NODE_ENV     = var.environment
    DATABASE_URL = module.rds.connection_string
    REDIS_URL    = module.redis.connection_string
    S3_BUCKET    = module.s3.bucket_name
  }

  health_check_path = "/health"
}

# ECS Fargate for Web App (Alternative: Use Vercel/Cloudflare Pages)
module "ecs_web" {
  source = "../../modules/ecs"

  project_name       = var.project_name
  environment        = var.environment
  service_name       = "web"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  container_image = var.web_container_image
  container_port  = 3000
  cpu             = var.web_cpu
  memory          = var.web_memory
  desired_count   = var.web_desired_count

  environment_variables = {
    NODE_ENV             = var.environment
    NEXT_PUBLIC_API_URL  = "https://api.${var.domain_name}"
    NEXTAUTH_URL         = "https://${var.domain_name}"
  }

  health_check_path = "/api/health"
}
