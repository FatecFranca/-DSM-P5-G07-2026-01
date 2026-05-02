import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchProperty', async: false })
export class MatchPropertyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [property] = args.constraints;
    const relatedValue = (args.object as Record<string, unknown>)[property];

    if (value === undefined || value === null) {
      return false;
    }

    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [property] = args.constraints;
    return `Valor deve corresponder a ${property}`;
  }
}

export function MatchProperty(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchPropertyConstraint,
    });
  };
}
