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

1.  In the Azure Portal, search for and select **NGINX for Azure**.
2.  Click **Create**.
3.  **Basics Tab:**
    * **Resource Group:** Select the specific Resource Group assigned to you for this workshop.
    * **Deployment Name:** Give your deployment a unique name (e.g., `nginx-deployment-lab1`).
    * **Region:** Select the region specified by your instructor.
    * **SKU:** Select the **Standard Monthly** SKU.
    * **NCU Capacity:** Enter the NGINX Capacity Unit (NCU) amount as directed by the lab requirements.
4.  **Networking Tab:**
    * **Virtual Network:** Select the VNet assigned to your resource group.
    * **Subnet:** Select the delegated subnet designated for NGINX.
    * **Access Consent:** Click the checkbox for **"I allow NGINX service provider to access the above virtual network for deployment."**
    * **Public IP:** Select the pre-provisioned Public IP address.
5.  **Identity Tab:**
    * Associate the **User Assigned Managed Identity** created during the setup phase.
6.  **Review + Create:**
    * Click **Review + Create**. Once validation passes, click **Create** to launch your NGINX instance.

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

NGINX as a Service for Azure is a service offering that is tightly integrated into Microsoft Azure public cloud and its ecosystem, making applications fast, efficient, and reliable with full lifecycle management of advanced NGINX traffic services. NGINXaaS for Azure is available in the Azure Marketplace.

NGINXaaS for Azure is powered by NGINX Plus, which extends NGINX Open Source with advanced functionality and provides customers with a complete application delivery solution. Initial use cases covered by NGINXaaS include L4 TCP and L7 HTTP load balancing and reverse proxy which can be managed through various Azure management tools. NGINXaaS allows you to provision distinct deployments as per your business or technical requirements.

In this section you will be looking at NGINX for Azure resource that you created within Azure portal.

Open Azure portal within your browser and then open your resource group.




Congratulations!!! you have successfully deployed the sample index page within NGINX for Azure. This also completes the validation of all the resources that you created using Azure CLI. In the upcoming labs you would be modifying the configuration files and exploring various features of NGINX for Azure resources.


This completes Lab1.

