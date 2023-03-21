import { strict as assert } from 'assert';
import axios from "axios";

describe("Question Test suite", () => {
    
    before(() => {
        // Wait for the service to start
        let delay = new Promise(resolve => setTimeout(resolve, 3000))
        return delay
    })
    describe("Question Test suite", () => {    

        it ("Should create a question successfully", async () => {
            return await axios.post("http://127.0.0.1:8080/api/v1/questions", {
                text: "Test question",
                banned: false,
                trip: "640096b817e92da01d729a64"
            }).then(res => {
                assert.equal(res.status, 201);
            });
        });
    })
})