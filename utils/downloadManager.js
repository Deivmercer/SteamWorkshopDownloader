const fs = require("fs");
const request = require("request");
const { JSDOM } = require("jsdom");
const { log } = require("./logger");

const dir = process.env.OUTPUT_FOLDER;

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

        if(process.cwd() !== dir) {
            log.debug("Moving working directory to " + dir);
            process.chdir(dir);
        }

        let path = fileDetails.filename;
        let fileStream = this.createDir(path);
        let self = this;

        return new Promise(function (resolve, reject) {

            request.get(fileDetails.file_url)
                .on("error", err => reject(err))
                .pipe(fileStream);
            self.updateXml(path)
                .then(err => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
        });
    },

    updateXml: async function (path) {

        if(process.cwd() !== dir) {
            log.debug("Moving working directory to " + dir);
            process.chdir(dir);
        }

        return await JSDOM.fromFile("bruh.txt", {contentType: "text/xml"})
            .then(dom => {

                log.debug("Document parsed");
                let xmlDoc = dom.window.document;
                let newChildNode = xmlDoc.createElement("map");
                let newTextNode = xmlDoc.createTextNode(path.split("Downloaded/")[1].replace("/", "\\"));
                newChildNode.appendChild(newTextNode);
                xmlDoc.documentElement.appendChild(newChildNode);

                // Note: XML header is removed
                return fs.writeFile("map_list.txt", xmlDoc.documentElement.outerHTML, err => {

                    if (err)
                        return err;
                    log.info("XML successfully updated");
                });
            })
            .catch(err => { return err });
    }
}