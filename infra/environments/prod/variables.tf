variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "innovation-lab"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Free tier
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20 # Free tier
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "innovationlab"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "dbadmin"
}

variable "db_backup_retention" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

# Redis
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro" # Free tier
}

# ECS API
variable "api_container_image" {
  description = "Docker image for API service"
  type        = string
  default     = "innovation-lab-api:latest"
}

variable "api_cpu" {
  description = "CPU units for API container"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "Memory for API container in MB"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 1
}

# ECS Web
variable "web_container_image" {
  description = "Docker image for web service"
  type        = string
  default     = "innovation-lab-web:latest"
}

variable "web_cpu" {
  description = "CPU units for web container"
  type        = number
  default     = 256
}

variable "web_memory" {
  description = "Memory for web container in MB"
  type        = number
  default     = 512
}

variable "web_desired_count" {
  description = "Desired number of web tasks"
  type        = number
  default     = 1
}

# Domain
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "innovationlab.example.com"
}

# Tags
variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
