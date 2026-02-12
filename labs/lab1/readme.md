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

## Prerequisites

- You must have an Azure account
- You must have the Azure CLI software installed on your local system
- See `Lab0` for instructions on setting up your system for this Workshop
- Familiarity with basic Linux concepts and commands
- Familiarity with basic Azure concepts and commands
- Familiarity with basic Nginx concepts and commands

<br/>

![lab1 diagram](media/lab1_diagram.png)

<br/>

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


### Explore Nginx for Azure

<br/>

NGINX as a Service for Azure is a service offering that is tightly integrated into Microsoft Azure public cloud and its ecosystem, making applications fast, efficient, and reliable with full lifecycle management of advanced NGINX traffic services. NGINXaaS for Azure is available in the Azure Marketplace.

NGINXaaS for Azure is powered by NGINX Plus, which extends NGINX Open Source with advanced functionality and provides customers with a complete application delivery solution. Initial use cases covered by NGINXaaS include L4 TCP and L7 HTTP load balancing and reverse proxy which can be managed through various Azure management tools. NGINXaaS allows you to provision distinct deployments as per your business or technical requirements.

In this section you will be looking at NGINX for Azure resource that you created within Azure portal.

1. Open Azure portal within your browser and then open your resource group.

   ![Portal ResourceGroup home](images/lab1_portal_rg_home.png)

2. Click on your NGINX for Azure resource (nginx4a) which should open the Overview section of your resource. You can see useful information like Status, NGINX for Azure resource's public IP, which Nginx version is running, which vnet/subnet it is using, etc.

   ![Portal N4A home](images/lab1_portal_n4a_home.png)

3. From the left pane click on `Settings > NGINX Configuration`. As you are opening this resource for first time and you do not have any configuration present, Azure will prompt you to "Get started with a Configuration example". Click on `Populate now` button to start with a sample configuration example.

   ![nginx conf populate](images/lab1_nginx_conf_populate.png)

4. Once you click on the `Populate now` button you will see the configuration editor section has been populated with `nginx.conf` and an `index.html` page. Click on the `Submit` button to deploy this sample config files to the NGINX for Azure resource.

   ![nginx conf editor](images/lab1_nginx_conf_editor.png)

5. Once you have submitted the configuration, you can watch its progress in the notification tab present in right top corner. Intially status would be "Updating NGINX configuration" which would change to "Updated NGINX configuration successfully".

   ![nginx conf submit success](images/lab1_nginx_conf_submit_success.png)

6. Navigate back to Overview section and copy the public IP address of NGINX for Azure resource.

   ![Copy IP Address](images/lab1_copy_ip_address.png)

7. In a new browser window, paste the public IP into the address bar. You will notice the sample index page gets rendered into your browser.

   ![n4a Index Page](images/lab1_n4a_index_page.png)

8. Congratulations!!! you have successfully deployed the sample index page within NGINX for Azure. This also completes the validation of all the resources that you created using Azure CLI. In the upcoming labs you would be modifying the configuration files and exploring various features of NGINX for Azure resources.

<br/>

**This completes Lab1.**

<br/>


Congratulations!!! you have successfully deployed the sample index page within NGINX for Azure. This also completes the validation of all the resources that you created using Azure CLI. In the upcoming labs you would be modifying the configuration files and exploring various features of NGINX for Azure resources.


This completes Lab1.

