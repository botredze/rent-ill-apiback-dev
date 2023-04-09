export class PasswordRequest {
    password: string;
}

export class CheckPasswordWithHashRequest extends PasswordRequest {
    hash: string;
    salt: string;
}
