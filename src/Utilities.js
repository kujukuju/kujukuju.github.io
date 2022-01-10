class Utilities {
    static hermite(t, points, tangentials, returnPoint) {
        const n1 = 2 * t * t * t - 3 * t * t + 1;
        const n2 = t * t * t - 2 * t * t + t;
        const n3 = -2 * t * t * t + 3 * t * t;
        const n4 = t * t * t - t * t;

        returnPoint.x = n1 * points[0].x + n2 * tangentials[0].x + n3 * points[1].x + n4 * tangentials[1].x;
        returnPoint.y = n1 * points[0].y + n2 * tangentials[0].y + n3 * points[1].y + n4 * tangentials[1].y;
    }
}