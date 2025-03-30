import { Request } from 'express';
import { getAuth } from '@clerk/express';

export class OrganizationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrganizationValidationError';
  }
}

export const validateOrganization = (req: Request, orgId: string | undefined): void => {
  const auth = getAuth(req);
  const tokenOrgId = auth.orgId;
  console.log(tokenOrgId, orgId)

  if (!tokenOrgId) {
    throw new OrganizationValidationError('Organization ID not found in token');
  }

  if (!orgId) {
    throw new OrganizationValidationError('Organization ID not provided in request');
  }

  if (tokenOrgId !== orgId) {
    throw new OrganizationValidationError('Organization ID mismatch');
  }
}; 