import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { commonConstants } from '..';
import { ExternalUserInfo } from '../auth';

export function IsAppEmail(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsAppEmail',
            target: object.constructor,
            propertyName: propertyName,
            options: { message: 'API_ERROR_WRONG_INPUT_EMAIL', ...validationOptions },
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return (
                        typeof value === 'string' &&
                        value.length <= commonConstants.maxEmailLength &&
                        /\S+@\S+\.\S+/.test(value)
                    );
                },
            },
        });
    };
}
