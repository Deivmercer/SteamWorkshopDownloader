const fs = require("fs");
const request = require("request");
const path = require("path");
const { JSDOM } = require("jsdom");
const { log } = require("./logger");

const outputFolder = process.env.OUTPUT_FOLDER;
const outputXmlPath = process.env.OUTPUT_XML_PATH;

module.exports = {

    createDir: function (dirName) {

        for(let sub of  dirName.split("/")) {
            if(sub.toLowerCase().endsWith(".gbx")) {
                log.debug("Creating file " + sub);
                return fs.createWriteStream(sub);
            }
            sub += "/";
            if(!fs.existsSync(sub)) {
                log.debug("Creating folder " + sub);
                fs.mkdirSync(sub);
            }
            process.chdir(sub);
        }
    },

    getPublishedFileDetails: function (id) {

        let headers = {
            form: {
                format: 'json',
                itemcount: 1,
                publishedfileids: [id]
            },
            json: true
        }

        log.debug("Sending post request with the following headers: " + JSON.stringify(headers));

        return new Promise(function (resolve, reject) {

            request.post(process.env.REQUEST_URL, headers, function (err, res, data) {
                if (err)
                    reject(err);
                else if (!data || !data.response || !data.response.publishedfiledetails)
                    reject(new Error("Cannot get content information from Steam Workshop for id " + id));
                else
                    resolve(data.response.publishedfiledetails[0]);
            })
        });
    },

    downloadFile: function (fileDetails) {

        if(process.cwd() !== outputFolder) {
            log.debug("Moving working directory to " + outputFolder);
            process.chdir(outputFolder);
        }

        let contentPath = fileDetails.filename.toLocaleLowerCase();
        let fileStream = this.createDir(contentPath);
        let self = this;

        return new Promise(function (resolve, reject) {
            request.get(fileDetails.file_url)
                .on("error", err => reject(err))
                .pipe(fileStream);
            self.updateXml(contentPath)
                .then(err => {
                    if (err)
                        reject(err);
                    else
                        resolve(contentPath);
                });
        });
    },

    updateXml: async function (contentPath) {

        let dir = path.dirname(outputXmlPath);
        if(process.cwd() !== dir) {
            log.debug("Moving working directory to " + dir);
            process.chdir(dir);
        }

        return await JSDOM.fromFile(outputXmlPath, {contentType: "text/xml"})
            .then(dom => {
                log.debug("Document parsed");
                let xmlDoc = dom.window.document;
                let newChildNode = xmlDoc.createElement("map");
                let newTextNode = xmlDoc.createTextNode(contentPath.split("downloaded")[1]);
                newChildNode.appendChild(newTextNode);
                xmlDoc.documentElement.appendChild(newChildNode);

                // Note: XML header is removed
                return fs.writeFile(outputXmlPath, xmlDoc.documentElement.outerHTML, err => {
                    if (err)
                        return err;
                    log.info("XML successfully updated");
                });
            })
            .catch(err => { return err });
    }
}
