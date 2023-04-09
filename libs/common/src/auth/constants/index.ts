export const authConstants = () => ({
    defaultEmailDomain: 'external-user',
    sessionTTL: parseInt(process.env.JWT_MAX_AGE_SEC || '3600', 10),
    resetTokenTTL: parseInt(process.env.JWT_RESET_PASSWORD_MAX_AGE_SEC || '60', 10),
    maxTokenLength: 255,
    maxEmailLength: 255,
});
