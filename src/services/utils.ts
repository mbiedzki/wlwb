/**
 * Generates a random color based on the given number of steps and step value.
 * This function generates vibrant, evenly spaced colors, which is useful for creating distinguishable markers.
 *
 * @param {number} numOfSteps - The number of steps in the color gradient
 * @param {number} step - The step value determining the position in the color gradient
 * @return {string} The generated color in hexadecimal format (#RRGGBB)
 *
 * adapted from:
 * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 */
export const getRandomColor = (numOfSteps: number, step: number) => {
    let r = 0, g = 0, b = 0;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
    }
    let c = '#' + ('00' + (~~(r * 255)).toString(16)).slice(-2) + ('00' + (~~(g * 255)).toString(16)).slice(
        -2) + ('00' + (~~(b * 255)).toString(16)).slice(-2);
    return (c);
};
