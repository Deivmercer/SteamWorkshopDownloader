'use strict';

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { log } = require("./utils/logger");
const downloadManager = require("./utils/downloadManager");
const DBManager = require("./utils/DBManager");

const app = express();
app.use(cors());
app.use(express.static(__dirname + "/swdownloader"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const connection = DBManager.createConnection(path.join(__dirname, "/db/swdownloader.db"));

const portNumber = process.env.PORT || 3000;

downloadManager.createDir(process.env.OUTPUT_FOLDER);

app.use("/swdownloader/signupaction", function (req, res) {

    DBManager.selectSingleUser(connection, req.body)
        .then(row => {
            if(row === -1) {
                DBManager.insertUser(connection, req.body)
                    .then(() => {
                        logIn(req, res);
                    }).catch(err => {
                    console.log(err);
                    res.status(500).send(err);
                })
            } else
                res.status(400).send("Already registered.");
        })
});

app.use("/swdownloader/loginaction", logIn);

function logIn(req, res) {

    DBManager.selectSingleUser(connection, req.body)
        .then(row => {
            if(row === -1)
                res.status(401).send("User not found");
            else
                res.status(200).send(row);
        }).catch(err => {
            console.log(err);
        })
}

app.use("/swdownloader/downloadaction", function (req, res) {

    log.info("User requested " + req.body.contentId);

    DBManager.selectSingleMap(connection, req.body.contentId)
        .then(row => {
            if(row === -1) {
                downloadManager.getPublishedFileDetails(req.body.contentId)
                    .then(fileDetails => {
                        downloadManager.downloadFile(fileDetails, downloadManager.updateXml)
                            .then(path => {
                                DBManager.insertMap(connection, path, req.body.contentId, req.body.userId)
                                    .then(() => res.status(200).send("Download succesfull."))
                                    .catch(err => res.status(500).send(err));
                            }).catch(err => {
                                log.error(err);
                                res.status(500).send("Cannot download file with id " + req.params.id);
                            });
                    }).catch(err => {
                        log.error(err);
                        res.status(400).send("Cannot get content information from Steam Workshop for id " + req.params.id);
                    });
            } else
                res.status(200).send("Map already downloaded.");
        })
        .catch(err => {
            log.error(err)
            res.status(500).send(err);
        });
});

app.use("/swdownloader/listusers", function (req, res) {

    DBManager.selectAllUsers(connection)
        .then(rows => {
            res.status(200).send(rows);
        }).catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
});

app.use("/swdownloader/updateuser", function (req, res) {

    DBManager.updateUserPermission(connection, req.body.userId, req.body.permission)
        .then(() => res.status(200).send("Successfully updated."))
        .catch(err => {
        console.log(err);
        res.status(500).send(err);
    })
});

app.use(function(req, res) {

    log.warn("404 for page " + req.originalUrl);
    return res.sendFile("/swdownloader/index.html", { root: __dirname })
});

function serverStart(){

    log.info("Express server listening on port: " + portNumber);
}

if(process.env.TLS_KEY_PATH && process.env.TLS_CERT_PATH &&
    fs.existsSync(process.env.TLS_KEY_PATH) &&
    fs.existsSync(process.env.TLS_CERT_PATH)){

    let options = {
        key: fs.readFileSync(process.env.TLS_KEY_PATH),
        cert: fs.readFileSync(process.env.TLS_CERT_PATH)
    }

    https.createServer(options, app).listen(portNumber, serverStart);
}else{
    app.listen(portNumber, serverStart);
}
