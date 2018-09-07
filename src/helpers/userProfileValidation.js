import Joi from 'joi';

const userProfileSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  mobilePhone: Joi.string(),
  local: {
    email: Joi.string().required()
  },
  administrative: Joi.object().keys({
    driveFolder: Joi.object().keys({
      id: Joi.string()
    }),
    identity: Joi.object().keys({
      nationality: Joi.string().required(),
      dateOfBirth: Joi.string().required(),
      birthCountry: Joi.string().required(),
      birthState: Joi.string().required(),
      birthCity: Joi.string().required(),
      socialSecurityNumber: Joi.number().required()
    }),
    contact: Joi.object().keys({
      address: Joi.string().required(),
      additionalAddress: Joi.string().allow('', null),
      zipCode: Joi.string().required(),
      city: Joi.string().required()
    }),
    emergencyContact: Joi.object().keys({
      name: Joi.string().required(),
      phoneNumber: Joi.string().required()
    }).required(),
    payment: {
      rib: {
        iban: Joi.string().required(),
        bic: Joi.string().required()
      }
    },
    identityDocs: Joi.string().when('administrative.driveFolder', { is: Joi.exist(), then: Joi.required() }),
    mutualFund: Joi.object().keys({
      has: Joi.boolean().required(),
      driveId: Joi.string().allow(null).when('has', { is: true, then: Joi.required() }),
      link: Joi.string().allow(null)
    }).when('administrative.driveFolder', { is: Joi.exist(), then: Joi.required() }),
    navigoInvoice: {
      driveId: Joi.string(),
      link: Joi.string()
    },
    transportInvoice: Joi.object().keys({
      transportType: Joi.string().required(),
      driveId: Joi.string().when('transportType', { is: 'public', then: Joi.required() }),
      link: Joi.string()
    }).when('administrative.driveFolder', { is: Joi.exist(), then: Joi.required() }),
    phoneInvoice: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string()
    }).when('administrative.driveFolder', { is: Joi.exist(), then: Joi.required() }),
    certificates: Joi.array().when('administrative.driveFolder', { is: Joi.exist(), then: Joi.array().min(1) }),
    healthAttest: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string()
    }).when('administrative.driveFolder', { is: Joi.exist(), then: Joi.required() }),
    idCardRecto: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string()
    }).when('administrative.identityDocs', { is: 'cni', then: Joi.required() }),
    idCardVerso: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string()
    }).when('administrative.identityDocs', { is: 'cni', then: Joi.required() }),
    passport: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string()
    }).when('administrative.identityDocs', { is: 'pp', then: Joi.required() }),
    residencePermit: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string()
    }).when('administrative.identityDocs', { is: 'ts', then: Joi.required() })
  })
});

const options = {
  abortEarly: false,
  allowUnknown: true
};

export const userProfileValidation = (profile) => Joi.validate(profile, userProfileSchema, options);
