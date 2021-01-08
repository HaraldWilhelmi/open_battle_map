import {Coordinate} from "../../api/Types";


export function getDistanceInMeters(p1: Coordinate, p2: Coordinate, pixelsPerMeter: number): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distanceInMapPixels = Math.sqrt(dx * dx + dy * dy);
    return distanceInMapPixels / pixelsPerMeter;
}


export function getGurpsRangeModifier(distanceInMeters: number): number {
    // In Europe we have the metric system.
    // For game purpose that means: 1 meter = 1 yard
    // Basta!

    let result = 2;
    let toDo = distanceInMeters;
    let powersOfTen = Math.floor(Math.log10(toDo));
    if ( powersOfTen >= 1 ) {
        result = result - 6 * powersOfTen;
        toDo = toDo / Math.pow(10, powersOfTen);
    }
    if ( toDo > 7 ) { result -= 1 }
    if ( toDo > 5 ) { result -= 1 }
    if ( toDo > 3 ) { result -= 1 }
    if ( toDo > 2 ) { result -= 1 }
    if ( toDo > 1.5 ) { result -= 1 }
    if ( toDo > 1 ) { result -= 1 }
    return result > 0 ? 0 : result;
}
