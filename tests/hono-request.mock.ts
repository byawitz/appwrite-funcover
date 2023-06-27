const generalData = {'data': 'someData'};

const c = {
    req: {
        contentType: 'json',
        method     : 'GET',
        header(header: string) {
            return this.contentType;
        },
        query(data: string): string | undefined {
            return 'someData';
        },
        json(): Promise<Record<string, string>> {
            return new Promise((resolve) => {
                resolve(generalData);
            });
        },
        parseBody(): Promise<Record<string, string>> {
            return this.json();
        }
    },
    json(object: any) {
        return object
    }
};

export {c, generalData}