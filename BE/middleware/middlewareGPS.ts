import express from 'express';


const getRandomInRange = (min: number, max: number): number => {
  return +(Math.random() * (max - min) + min).toFixed(6);
};

export const generaCoordinateTrento = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const lat = getRandomInRange(46.04, 46.10);
  const lon = getRandomInRange(11.08, 11.14);

  req.body.coordinateGps = {
    type: 'Point',
    coordinates: [lon, lat] // GeoJSON usa [longitudine, latitudine]
  };

  console.log("sono il middleware!!!");
    next();
};

