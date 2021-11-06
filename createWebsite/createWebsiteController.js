const AWS = require('aws-sdk')
const fs = require('fs')
const unzipper = require('unzipper')


exports.createWebsite = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    AWS.config.update({region: 'us-west-2'})
    const s3 = new AWS.S3()
    const fileName = req.files.file.name.split('.')[0]
    const file = req.files.file.path
    const username = req.fields.username
    const bucketName = `${username}-static-website`
    
    const createBucketParams = {
        Bucket: bucketName
    }

    s3.createBucket(createBucketParams, (err, data) => {
        if (err && err.statusCode == 409) {
        console.log('Bucket has been created already')
        } else if (err) {
            console.log(err)
        } else {
        console.log('Bucket Created Successfully', data.Location)

        let policy = {
            "Version": "2008-10-17",
            "Statement": [
                {
                    "Sid": "AllowPublicRead",
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": "*"
                    },
                    "Action": "s3:GetObject",
                    "Resource": `arn:aws:s3:::${username}-static-website/*`
                }
            ]
        }

        let bucketPolicyParams = {
            Bucket: bucketName,
            Policy: JSON.stringify(policy)
        }

        s3.putBucketPolicy(bucketPolicyParams, function(err, data) {
            if (err) {
            console.log('Error', err)
            } else {
            console.log('Success', data)
            }
        })

        let staticHostParams = {
            Bucket: bucketName,
            WebsiteConfiguration: {
            IndexDocument: {
                    Suffix: 'index.html'
                },
            }
        }

        s3.putBucketWebsite(staticHostParams, function(err, data) {
            if (err) {
            console.log('Error', err)
            } else {
            console.log('Success Website', data)
            }
        })
        }

        fs.createReadStream(file)
        .pipe(unzipper.Extract({ path: `./${username}/` }))
        .promise()
        .then(() => {
            const uploadParams = {
            Bucket: bucketName,
            Key: '', 
            Body: '',
            ContentType: 'text/html'
            }

            //make recursive for all files
            fs.readdir(`./${username}/${fileName}`, (err, files) => {
            files.forEach(file => {
                let fileStream = fs.createReadStream(`./${username}/${fileName}/${file}`)
                
                fileStream.on('error', (err) => {
                    console.log('File Error', err)
                })
        
                uploadParams.Body = fileStream
                uploadParams.Key = file
                
                s3.upload(uploadParams, (err, data) => {
                    if (err) {
                        console.log('Error', err)
                    } if (data) {
                        console.log('Success', data.Location)

                    }
                })
            })

            res.send(`http://${bucketName}.s3-website-us-west-2.amazonaws.com/`)
            })
        })
  })
}