
let request: string = '-';
let responseStatus: number | undefined = undefined;
let responseStatusText: string | undefined;
let responseText: string | undefined;
let responseJson: any | undefined;



export function logRequest(newRequest: string): void {
    request = newRequest;
    responseStatus = undefined;
    responseStatusText = undefined;
    responseText = undefined;
    responseJson = undefined;
}

export function logResponseMeta(response: Response): void {
    responseStatus = response.status;
    responseStatusText = response.statusText;
}

export function logResponseText(text: string): void {
    responseText = text;
}

export function logResponseJson(json: any): void {
    responseJson = json;
}

export function reportApiProblem(error?: Error): void {
    console.log("ERROR during API operation:");
    if ( error ) {
        console.log(error.message);
    }
    console.trace();
    console.log("Request: " + request);
    if ( responseStatus ) {
        console.log("Response: " + responseStatus + " " + responseStatusText);
        if ( responseText ) {
            console.log("=== Start Response Text ===");
            console.log(responseText);
            console.log("=== End Response Text ===");
        } else if ( responseJson ) {
            console.log("=== Start Response ===");
            console.log(JSON.stringify(responseJson));
            console.log("=== End Response ===");
        }
    } else {
        console.log("Response: -");
    }
}
