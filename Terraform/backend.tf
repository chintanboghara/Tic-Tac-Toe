terraform {
  backend "s3" {
    bucket         = "tic-tac-toe-terraform-state-bucket"
    key            = "tic-tac-toe/terraform.tfstate"
    region         = "ap-south-2"
    dynamodb_table = "tic-tac-toe-terraform-lock"              
  }
}
