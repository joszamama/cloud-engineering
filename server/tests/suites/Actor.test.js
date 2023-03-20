import { strict as assert } from 'assert';
import axios from "axios";

describe("Actor Test suite", () => {
    before(() => {
        // Wait for the service to start
        let delay = new Promise(resolve => setTimeout(resolve, 3000))
        return delay
    })
    describe("Explorer Test suite", () => {    
        let explorerToken;

        it ("Should register successfully as Explorer", async () => {
            return await axios.post("http://127.0.0.1:8080/api/v1/actors", {
                name: "John",
                surname: "Doe",
                password: "test1234",
                email: "johndoe@gmail.com",
                role: "Explorer",
                phone: "+34 123456789",
                address: "Calle test 123",
                banned: false,
                preferredLanguage: "English"
            }).then(res => {
                assert.equal(res.status, 201);
            });
        });

        it ("Should login successfully as Explorer", async () => {
            return await axios.post("http://127.0.0.1:8080/api/v1/login", {
                email: "johndoe@gmail.com",
                password: "test1234"
            }).then(async res => {
                const token = res.data;

                assert.equal(res.status, 201);
                assert.notEqual(token, undefined);
                
                await axios.post("http://127.0.0.1:8081/login", {token}).then(res => {
                    explorerToken = res.data;

                    assert.equal(res.status, 201);
                    assert.notEqual(explorerToken?._tokenResponse?.idToken, undefined);
                });
            });
        });

        it ("Should get Explorer data successfully using token uid", async () => {
            return await axios.get("http://127.0.0.1:8080/api/v1/actors/" + explorerToken.user.uid,
            { headers: {
                Authorization: "Bearer " + explorerToken._tokenResponse.idToken
            }}).then( async res => {
                const actor = res.data;

                assert.equal(res.status, 200);
                assert.equal(actor.name, "John");
                assert.equal(actor.surname, "Doe");
                assert.equal(actor.email, "johndoe@gmail.com");
            })
        });

        it ("Should not delete Explorer (Permission denied)", async () => {
            return await axios.delete("http://127.0.0.1:8080/api/v1/actors/" + explorerToken.user.uid,
            { headers: {
                Authorization: "Bearer " + explorerToken._tokenResponse.idToken
            }}).catch( async err => {
                assert.equal(err.response?.status, 403);
            })
        });
    })

    describe("Sponsor Test suite", () => {
        let sponsorToken;

        it ("Should register successfully as Sponsor", async () => {
            return await axios.post("http://127.0.0.1:8080/api/v1/actors", {
                name: "John Sponsor",
                surname: "Doe",
                password: "test1234",
                email: "johndoesponsor@gmail.com",
                role: "Sponsor",
                phone: "+34 123456789",
                address: "Calle test 123",
                banned: false,
                preferredLanguage: "German"
            }).then(res => {
                assert.equal(res.status, 201);
            });
        });

        it ("Should login successfully as Sponsor", async () => {
            return await axios.post("http://127.0.0.1:8080/api/v1/login", {
                email: "johndoesponsor@gmail.com",
                password: "test1234"
            }).then(async res => {
                const token = res.data;

                assert.equal(res.status, 201);
                assert.notEqual(token, undefined);
                
                await axios.post("http://127.0.0.1:8081/login", {token}).then(res => {
                    sponsorToken = res.data;

                    assert.equal(res.status, 201);
                    assert.notEqual(sponsorToken?._tokenResponse?.idToken, undefined);
                });
            });
        });

        it ("Should get Explorer data successfully using token uid", async () => {
            return await axios.get("http://127.0.0.1:8080/api/v1/actors/" + sponsorToken.user.uid,
            { headers: {
                Authorization: "Bearer " + sponsorToken._tokenResponse.idToken
            }}).then( async res => {
                const actor = res.data;

                assert.equal(res.status, 200);
                assert.equal(actor.name, "John Sponsor");
                assert.equal(actor.surname, "Doe");
                assert.equal(actor.email, "johndoesponsor@gmail.com");
            })
        });

        it ("Should be able to create sponsorships for trips", async () => {
            return await axios.post("http://127.0.0.1:8080/api/v1/sponsorships", {
                banner: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
                link: "https://www.google.com",
                trip: "5f9f1b9b9b9b9b9b9b9b9b9b"
            }, { headers: {
                Authorization: "Bearer " + sponsorToken._tokenResponse.idToken
            }}).then( async res => {
                assert.equal(res.status, 201);
            })
        });
    });
})