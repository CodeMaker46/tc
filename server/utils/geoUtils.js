

// Compute perpendicular distance from point C to line segment AB
export const perpendicularDistance = (A, B, C) => {
  const toRadians = deg => deg * (Math.PI / 180);
  const R = 6371e3; // Earth radius in meters

  const φ1 = toRadians(A.lat);
  const φ2 = toRadians(B.lat);
  const λ1 = toRadians(A.lng);
  const λ2 = toRadians(B.lng);

  const φ3 = toRadians(C.lat);
  const λ3 = toRadians(C.lng);

  const x1 = R * Math.cos(φ1) * Math.cos(λ1);
  const y1 = R * Math.cos(φ1) * Math.sin(λ1);
  const z1 = R * Math.sin(φ1);

  const x2 = R * Math.cos(φ2) * Math.cos(λ2);
  const y2 = R * Math.cos(φ2) * Math.sin(λ2);
  const z2 = R * Math.sin(φ2);

  const x3 = R * Math.cos(φ3) * Math.cos(λ3);
  const y3 = R * Math.cos(φ3) * Math.sin(λ3);
  const z3 = R * Math.sin(φ3);

  const AB = [x2 - x1, y2 - y1, z2 - z1];
  const AC = [x3 - x1, y3 - y1, z3 - z1];

  const cross = [
    AB[1] * AC[2] - AB[2] * AC[1],
    AB[2] * AC[0] - AB[0] * AC[2],
    AB[0] * AC[1] - AB[1] * AC[0],
  ];

  const crossMag = Math.sqrt(cross[0]**2 + cross[1]**2 + cross[2]**2);
  const abMag = Math.sqrt(AB[0]**2 + AB[1]**2 + AB[2]**2);

  return crossMag / abMag; // in meters
};
