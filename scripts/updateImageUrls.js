"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function updateUrls() {
    return __awaiter(this, void 0, void 0, function () {
        var images, updated, _i, images_1, image, keyParts, userId, hashName, hasCorrectOriginalUrl, hasCorrectWebpUrl, hasCorrectBlurUrl, originalUrl, webpUrl, blurUrl, error_1;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 6, 7, 9]);
                    return [4 /*yield*/, prisma.images.findMany({
                            select: {
                                id: true,
                                key: true,
                                originalUrl: true,
                                webpUrl: true,
                                blurUrl: true,
                                userId: true,
                            },
                        })];
                case 1:
                    images = _f.sent();
                    console.log("Found ".concat(images.length, " images to update"));
                    updated = 0;
                    _i = 0, images_1 = images;
                    _f.label = 2;
                case 2:
                    if (!(_i < images_1.length)) return [3 /*break*/, 5];
                    image = images_1[_i];
                    // Skip if no key (we need this to extract information)
                    if (!image.key) {
                        console.log("Image ".concat(image.id, " has no key, skipping"));
                        return [3 /*break*/, 4];
                    }
                    keyParts = image.key.split('/');
                    userId = void 0;
                    hashName = void 0;
                    if (keyParts.length === 2) {
                        // Old format: userId/hashName
                        userId = keyParts[0], hashName = keyParts[1];
                    }
                    else if (keyParts.length === 3 && keyParts[1] === 'original') {
                        // New format: userId/original/hashName
                        userId = keyParts[0];
                        hashName = keyParts[2];
                    }
                    else {
                        console.log("Cannot parse key for image ".concat(image.id, ": ").concat(image.key));
                        return [3 /*break*/, 4];
                    }
                    // Use userId from the image record if available and different
                    if (image.userId && userId !== image.userId) {
                        console.log("Warning: userId from key (".concat(userId, ") doesn't match record (").concat(image.userId, "), using record value"));
                        userId = image.userId;
                    }
                    hasCorrectOriginalUrl = (_a = image.originalUrl) === null || _a === void 0 ? void 0 : _a.includes("/".concat(userId, "/original/"));
                    hasCorrectWebpUrl = ((_b = image.webpUrl) === null || _b === void 0 ? void 0 : _b.includes("/".concat(userId, "/placeholder/"))) &&
                        ((_c = image.webpUrl) === null || _c === void 0 ? void 0 : _c.endsWith('.webp'));
                    hasCorrectBlurUrl = ((_d = image.blurUrl) === null || _d === void 0 ? void 0 : _d.includes("/".concat(userId, "/blur/"))) &&
                        ((_e = image.blurUrl) === null || _e === void 0 ? void 0 : _e.endsWith('.webp'));
                    // Skip if all URLs are already in the correct format
                    if (hasCorrectOriginalUrl && hasCorrectWebpUrl && hasCorrectBlurUrl) {
                        console.log("Image ".concat(image.id, " already has correct URL format, skipping"));
                        return [3 /*break*/, 4];
                    }
                    originalUrl = "https://dmmuvefqy6r0i.cloudfront.net/".concat(userId, "/original/").concat(hashName);
                    webpUrl = "https://dmmuvefqy6r0i.cloudfront.net/".concat(userId, "/placeholder/").concat(hashName, ".webp");
                    blurUrl = "https://dmmuvefqy6r0i.cloudfront.net/".concat(userId, "/blur/").concat(hashName, ".webp");
                    // Update the database
                    return [4 /*yield*/, prisma.images.update({
                            where: { id: image.id },
                            data: {
                                originalUrl: originalUrl,
                                webpUrl: webpUrl,
                                blurUrl: blurUrl,
                                // Also update the key to match the new structure if it's in the old format
                                key: "".concat(userId, "/original/").concat(hashName),
                            },
                        })];
                case 3:
                    // Update the database
                    _f.sent();
                    updated++;
                    console.log("Updated image ".concat(image.id, " with new URLs"));
                    _f.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Update completed successfully. Updated ".concat(updated, " of ").concat(images.length, " images."));
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _f.sent();
                    console.error('Error updating URLs:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, prisma.$disconnect()];
                case 8:
                    _f.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
updateUrls();
