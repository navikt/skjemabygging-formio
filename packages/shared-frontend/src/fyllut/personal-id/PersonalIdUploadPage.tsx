import { ValidationScopeProvider } from '../../context/validation/ValidationScopeContext';
import PersonalIdUploadContent from './PersonalIdUploadContent';

const PersonalIdUploadPage = () => (
  <ValidationScopeProvider pageKey="personal-id">
    <PersonalIdUploadContent />
  </ValidationScopeProvider>
);

export default PersonalIdUploadPage;
