
let request: string = '-';
let responseStatus: number | undefined = undefined;
let responseStatusText: string | undefined;
let responseJson: any | undefined;



export function logRequest(newRequest: string): void {
    request = newRequest;
    responseStatus = undefined;
    responseStatusText = undefined;
    responseJson = undefined;
}

export function logResponseMeta(response: Response): void {
    responseStatus = response.status;
    responseStatusText = response.statusText;
}

export function logResponseJson(json: any): void {
    responseJson = json;
}

export function reportApiProblem(): void {
    console.log("Request: " + request);
    if ( responseStatus ) {
        console.log("Response: " + responseStatus + " " + responseStatusText);
        if ( responseJson ) {
            console.log("=== Start Response ===");
            console.log(JSON.stringify(responseJson));
            console.log("=== End Response ===");
        }
    } else {
        console.log("Response: -");
    }
}
