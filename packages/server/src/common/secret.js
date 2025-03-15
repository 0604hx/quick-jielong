const crypto = require('sm-crypto')
const jwt = require('jsonwebtoken')

/**
 * SM4加密（类似 AES）
 * @param {String} text
 * @param {String} key
 * @returns {String}
 */
exports.sm4Encrypt = (text, key)=> crypto.sm4.encrypt(text, key)

/**
 *
 * @param {String} text
 * @param {String} key
 * @returns {String}
 */
exports.sm4Decrypt = (text, key)=> crypto.sm4.decrypt(text, key)

exports.createSm4Key = ()=> crypto.sm3(`${Date.now()}`).substring(8, 40)

exports.sm3 = text=> crypto.sm3(text)

exports.stringToBase64 = o=> Buffer.from(typeof(o)=='string'?o:JSON.stringify(o)).toString('base64')

exports.base64ToString = text=> Buffer.from(text, 'base64').toString('utf-8')

/**
 * options 可设置 expiresIn 配置过期
 * @param {*} playload
 * @param {String} key
 * @param {jwt.SignOptions} options
 * @returns {String}
 */
exports.createJwtToken = (playload, key, options={})=> jwt.sign(playload, key, options)

exports.verifyJwtToken = (token, key)=> jwt.verify(token, key)
