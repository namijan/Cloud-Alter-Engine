const urn = "dXJuOmFkc2sud2lwcHJvZGFuejpmcy5maWxlOnZmLkV4Z2VxSWpsVEFxWUlIYzNCM3piTVE_dmVyc2lvbj0z";
const decoded = Buffer.from(urn.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
console.log(decoded);
