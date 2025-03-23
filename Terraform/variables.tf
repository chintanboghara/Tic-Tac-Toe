variable "image_name" {
  description = "The name of the Docker image to deploy"
  type        = string
  default     = "chintanboghara/tic-tac-toe"
}

variable "image_tag" {
  description = "The tag of the Docker image"
  type        = string
  default     = "latest"
}

variable "container_name" {
  description = "The name of the Docker container"
  type        = string
  default     = "tic-tac-toe"
}

variable "external_port" {
  description = "The external port to map to the container's port 80"
  type        = number
  default     = 8080
}

variable "network_name" {
  description = "The name of the Docker network"
  type        = string
  default     = "tic-tac-toe_net"
}
