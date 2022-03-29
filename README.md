# mailer-gun
NodeJS script for easily sending bulk emails.
## Introduction
This project allows bulk email sending with either raw text or handlebars templates.
## Required Skills
A very basic understanding of JavaScript, Handlebars and/or a persistent/intelligent mind is all that's required to make this script work for you.
## Contexts
*This only applies to emails sent with* `config.script.CONTENT_TYPE === "template"`
There are two levels of context in this script. The final context that the template has access to is composed of:
 - Global context that applies to all emails in the list
 - Specific context that applies to only the specific email
 
 The `./config/contexts.json` file contains the list of emails that need to get sent out.
```
// ./config/contexts.json
[
	{
		"email": "someone@else.com",
		"context": {
			"hello": "world",
			"name": "John Smith"
		}
	}
]
```

## Installation
Go through each of the steps below for easy implementation.
### Clone Repo
Download the codebase by running the below command
`git clone https://github.com/IvanJoh/mailer-gun.git`
### Install dependencies
Install all the required dependencies
`npm install`
### Copy Examples
Run the script to copy the example files
```
cd mailer-gun
sudo ./copyExamples.s
```
### Update Config files
Update all the `./config` files with your details, specifically your [Mailgun](https://www.mailgun.com/) credentials in `./config/main.js`
### Run Script
Start the script and follow the prompts to get your emails firing off.
`node gun.js`