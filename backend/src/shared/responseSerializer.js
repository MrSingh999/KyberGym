import mongoose from 'mongoose';

/**
 * Traverses and serializes response payloads.
 * Maps 'publicId' to 'id', strips '_id' and '__v'.
 * Bypasses Dates, ObjectIds, and primitive values correctly.
 * 
 * @param {*} data - The data payload to serialize.
 * @returns {*} The serialized data.
 */
export function serialize(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // If it's a Mongoose document, convert to POJO
  if (data.toObject && typeof data.toObject === 'function') {
    data = data.toObject({ virtuals: true });
  } else if (data._doc) {
    data = JSON.parse(JSON.stringify(data));
  }

  if (Array.isArray(data)) {
    return data.map(item => serialize(item));
  }

  if (data instanceof mongoose.Types.ObjectId || (data && data._bsontype === 'ObjectID')) {
    return data.toString();
  }

  if (typeof data === 'object') {
    // Keep Date objects intact
    if (data instanceof Date) {
      return data;
    }

    const serialized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key === '_id') {
          continue;
        }
        if (key === '__v') {
          continue;
        }
        if (key === 'id' && data.publicId !== undefined) {
          continue;
        }
        if (key === 'publicId') {
          serialized.id = data.publicId;
          continue;
        }
        serialized[key] = serialize(data[key]);
      }
    }
    return serialized;
  }

  return data;
}
