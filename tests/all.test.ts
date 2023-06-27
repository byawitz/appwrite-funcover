import {beforeEach, describe, expect, test} from "bun:test";
import {getData, getHeaders, getRawOrAll, runFunction} from "../inc/lib";
import {c, generalData} from "./hono-request.mock";
import functionResponse from "./function.mock";

global.fetch = () => {
    return new Promise<any>((resolve) => {
        resolve({
            json() {
                return new Promise((r) => {
                    r(functionResponse)
                })
            }
        });
    });
}

const baseReturnHeaders: Record<string, string> = {'content-type': 'application/json'};


describe('Checking Headers', function () {
    test('getHeaders return right data', async () => {
        const headers = await getHeaders('2');

        baseReturnHeaders['x-appwrite-project'] = '2';
        expect(headers).toEqual(baseReturnHeaders);
    });

    test('getHeaders added API key right data', async () => {
        const headers = await getHeaders('1');

        baseReturnHeaders['x-appwrite-key']     = 'key';
        baseReturnHeaders['x-appwrite-project'] = '1';

        expect(headers).toEqual(baseReturnHeaders);
    });
});

describe('Checking getRawOrAll', function () {

    test('Get data as string', async () => {

        expect(getRawOrAll(generalData)).toEqual(JSON.stringify(generalData));
    });

    test('Get rawData property', async () => {
        expect(getRawOrAll({...generalData, 'rawData': 'I am a raw data'})).toEqual('I am a raw data');
    });
})

describe('Checking getData', function () {
    describe('Check in POST', function () {
        beforeEach(() => {
            c.req.method = 'POST';
        });

        test('Check json data', async () => {
            const data = await getData(c);

            expect(data).toEqual({data: JSON.stringify(generalData)});
        });

        test('Check form data', async () => {
            c.req.contentType = 'form';

            const data = await getData(c);
            expect(data).toEqual({data: JSON.stringify(generalData)});
        });


        test('Check no data', async () => {
            c.req.contentType = '';
            const data        = await getData(c);

            expect(data).toEqual({'data': 'no_data'});
        });
    });

    describe('Check in GET', function () {
        beforeEach(() => {
            c.req.method = 'GET';
        });

        test('Check with data', async () => {
            const data = await getData(c);
            expect(data).toEqual({'data': 'someData'});
        });

        test('Check no data', async () => {
            c.req.query = (s) => undefined;

            const data = await getData(c);

            expect(data).toEqual({'data': 'no_data'});

        });
    });
});

describe('Check runFunction', function () {
    test('Function return the right block', async () => {
        const exeuction = await runFunction('1', '1', c);

        expect(exeuction).toEqual(functionResponse);
    });

    test('Function return the right data', async () => {
        const execution = await runFunction('1', '1', c);

        expect(JSON.parse(execution.response)).toEqual(generalData);
    });
});
