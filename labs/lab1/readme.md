# Lab 1: Deploying and Exploring NGINX for Azure

## Overview
Welcome to **App World 2026**. This lab is a core component of the session:  
**"Mastering cloud-native app delivery: Unlocking advanced capabilities and use cases with F5’s ADCaaS."**

In this module, you will transition from infrastructure prep to active service delivery. You will deploy your NGINX for Azure (NGINXaaS) resource, establish an observability pipeline, and verify your deployment with an initial configuration.

---

## 🏗️ Pre-provisioned Infrastructure
To maximize our time during this workshop, the following baseline infrastructure has already been provisioned for you:

* **Azure Resource Group:** A dedicated container for all workshop resources.
* **Virtual Network & Subnets:** A VNet including a delegated subnet specifically for NGINX for Azure.
* **Network Security Group (NSG):** Pre-configured rules for inbound traffic (Port 80/443).
* **Public IP Address:** A static IP address for the NGINX frontend.
* **Managed Identity:** A user-assigned identity for secure, secret-less access to Azure services.

---

## 🚀 Lab Exercises

### Task 1: Deploy an NGINX for Azure Resource
Now, you will deploy the NGINX for Azure resource and bind it to the pre-provisioned network and identity.

1.  In the Azure Portal, search for **NGINX for Azure**.
2.  Click **Create** and select the **Standard Monthly** SKU.
3.  Under the **Networking** tab, select the pre-provisioned VNet and delegated subnet.
4.  Associate the **Public IP** and the **User Assigned Managed Identity** created during the setup phase.
5.  Click **Review + Create**.

### Task 2: Create Log Analytics Workspace & Enable Monitoring
Before exploring the resource, we will set up the logging destination to ensure all subsequent activity is captured.

1.  In the Azure Portal, search for and select **Log Analytics workspaces**.
2.  Click **Create**, select your **Resource Group**, and name it (e.g., `nginx-workshop-logs`).
3.  Once created, navigate back to your **NGINX for Azure resource**.
4.  Under the **Monitoring** section, select **Diagnostic settings**.
5.  Select **+ Add diagnostic setting**.
6.  Check both **nginxAccessLog** and **nginxErrorLog**.
7.  Under "Destination details," check **Send to Log Analytics workspace** and select the workspace you just created.
8.  **Save** the settings.



### Task 3: Explore NGINX for Azure
Now that your resource is live and monitored, take a few minutes to explore the NGINX resource in the Azure Portal.

* **Overview:** View the status, SKU, and Public IP.
* **NGINX Configuration:** Note where the configuration files are managed directly in the portal.
* **Metrics:** Observe the built-in dashboards for HTTP requests and upstream health.

### Task 4: Create an Initial NGINX Configuration
Establish a basic configuration to ensure the service is processing traffic correctly.

1.  Navigate to the **NGINX Configuration** blade in your NGINX resource.
2.  Click on **+ Add Configuration File**.
3.  Set the path to `/etc/nginx/nginx.conf`.
4.  Use the following basic block:
   ```nginx
   http {
       server {
           listen 80;
           location / {
               default_type text/plain;
               return 200 "Welcome to App World 2026! NGINX for Azure is operational.";
           }
       }
   }
