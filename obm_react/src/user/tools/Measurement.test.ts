import each from 'jest-each';
import {Coordinate} from '../../api/Types';
import {getDistanceInMeters, getGurpsRangeModifier} from './Measurement';


test ('getDistanceInMeters - simple', () => {
    const p1: Coordinate = {x: 10, y: 10};
    const p2: Coordinate = {x: 50, y: 40};
    const result = getDistanceInMeters(p1, p2, 5);
    expect(result).toEqual(10);
});


each([
    [0, 0],
    [2, 0],
    [2.1, -1],
    [3, -1],
    [3.001, -2],
    [10, -4],
    [10.001, -5],
    [290, -13],
    [100000, -28],
    [100001, -29],
]).test ('getGurpsRangeModifier - range %f gives modifier %d', (range, expected) => {
    const result = getGurpsRangeModifier(range);
    expect(result).toEqual(expected);
});
