import Image from '../../../components/image/Image';
import { ImageDefinition } from '../../component-types';

interface InputImageProps {
  component: ImageDefinition;
}

const InputImage = ({ component }: InputImageProps) => {
  const src = component.image?.[0]?.url;

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={component.altText}
      widthPercent={component.widthPercent}
      description={component.description}
    />
  );
};

export default InputImage;
