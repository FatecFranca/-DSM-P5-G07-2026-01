import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * RN06: Validador customizado para idade mínima
 * Rejeita cadastros de usuários com menos de 13 anos
 */
@ValidatorConstraint({ name: 'isMinAge', async: false })
export class IsMinAgeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const minAge = (args.constraints && args.constraints[0]) || 13;
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge;
  }

  defaultMessage(args: ValidationArguments) {
    const minAge = (args.constraints && args.constraints[0]) || 13;
    return `Usuário deve ter pelo menos ${minAge} anos de idade`;
  }
}

/**
 * Decorator para validar idade mínima
 * @param minAge Idade mínima permitida (padrão: 13)
 * @param validationOptions Opções de validação
 */
export function IsMinAge(minAge = 13, validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge],
      validator: IsMinAgeConstraint,
    });
  };
}
