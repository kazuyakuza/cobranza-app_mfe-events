// Ensures the `reflect-metadata` polyfill is loaded before any DTO decorator
// runs during tests. The library itself does NOT import this polyfill.
import 'reflect-metadata';
