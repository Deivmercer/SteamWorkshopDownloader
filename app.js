'use strict';

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const downloadManager = require("./utils/downloadManager");
const { log } = require("./utils/logger");

const app = express();
app.use(cors());

const portNumber = process.env.PORT || 3000;

downloadManager.createDir(process.env.OUTPUT_FOLDER);

app.listen(portNumber, function () {

    log.info("Express server listening on port: " + portNumber);
});

app.use("/swdownloader/:id", function (req, res) {

    log.info("User requested " + req.params.id);
    downloadManager.getPublishedFileDetails(req.params.id)
        .then(fileDetails => {
            downloadManager.downloadFile(fileDetails, downloadManager.updateXml)
                .then(() => res.status(200).send("Done"))
                .catch(err => {
                    log.error(err);
                    res.status(500).send("Cannot download file with id " + req.params.id);
                });
        })
        .catch(err => {
            log.error(err);
            res.status(400).send("Cannot get content information from Steam Workshop for id " + req.params.id);
        });
});

app.use(function(req, res) {

    log.warn("Giving 404 for page " + req.originalUrl);
    return res.status(404).send("Not found");
});

