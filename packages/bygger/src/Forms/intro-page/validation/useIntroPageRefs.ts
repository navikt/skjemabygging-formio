import { RefObject, useRef } from 'react';

export interface IntroPageRefs {
  introduction: RefObject<HTMLDivElement>;
  'sections.prerequisites.title': RefObject<HTMLInputElement>;
  'sections.prerequisites.description': RefObject<HTMLDivElement>;
  'sections.prerequisites.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.prerequisites.message': RefObject<HTMLDivElement>;
  'sections.dataTreatment.title': RefObject<HTMLDivElement>;
  'sections.dataTreatment.description': RefObject<HTMLDivElement>;
  'sections.dataTreatment.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.dataTreatment.message': RefObject<HTMLDivElement>;
  'sections.dataDisclosure.title': RefObject<HTMLInputElement>;
  'sections.dataDisclosure.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.scope.title': RefObject<HTMLInputElement>;
  'sections.scope.description': RefObject<HTMLDivElement>;
  'sections.scope.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.scope.message': RefObject<HTMLDivElement>;
  'sections.outOfScope.title': RefObject<HTMLInputElement>;
  'sections.outOfScope.description': RefObject<HTMLDivElement>;
  'sections.outOfScope.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.outOfScope.message': RefObject<HTMLDivElement>;
  'sections.automaticProcessing.description': RefObject<HTMLDivElement>;
  'sections.automaticProcessing.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.automaticProcessing.message': RefObject<HTMLDivElement>;
  'sections.optional.title': RefObject<HTMLInputElement>;
  'sections.optional.description': RefObject<HTMLDivElement>;
  'sections.optional.bulletPoints': RefObject<Array<HTMLDivElement | null>>;
  'sections.optional.message': RefObject<HTMLDivElement>;
  'importantInformation.title': RefObject<HTMLInputElement>;
  'importantInformation.description': RefObject<HTMLDivElement>;
  selfDeclaration: RefObject<HTMLInputElement>;
}

export function useIntroPageRefs() {
  return {
    introduction: useRef<HTMLDivElement>(null),
    'importantInformation.title': useRef<HTMLInputElement>(null),
    'importantInformation.description': useRef<HTMLDivElement>(null),
    'sections.scope.title': useRef<HTMLInputElement>(null),
    'sections.scope.description': useRef<HTMLDivElement>(null),
    'sections.scope.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.scope.message': useRef<HTMLDivElement>(null),
    'sections.outOfScope.title': useRef<HTMLInputElement>(null),
    'sections.outOfScope.description': useRef<HTMLDivElement>(null),
    'sections.outOfScope.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.outOfScope.message': useRef<HTMLDivElement>(null),
    'sections.dataTreatment.title': useRef<HTMLDivElement>(null),
    'sections.dataTreatment.description': useRef<HTMLDivElement>(null),
    'sections.dataTreatment.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.dataTreatment.message': useRef<HTMLDivElement>(null),
    'sections.prerequisites.title': useRef<HTMLInputElement>(null),
    'sections.prerequisites.description': useRef<HTMLDivElement>(null),
    'sections.prerequisites.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.prerequisites.message': useRef<HTMLDivElement>(null),
    'sections.dataDisclosure.title': useRef<HTMLInputElement>(null),
    'sections.dataDisclosure.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.automaticProcessing.description': useRef<HTMLDivElement>(null),
    'sections.automaticProcessing.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.automaticProcessing.message': useRef<HTMLDivElement>(null),
    'sections.optional.title': useRef<HTMLInputElement>(null),
    'sections.optional.description': useRef<HTMLDivElement>(null),
    'sections.optional.bulletPoints': useRef<Array<HTMLDivElement | null>>([]),
    'sections.optional.message': useRef<HTMLDivElement>(null),
    selfDeclaration: useRef<HTMLInputElement>(null),
  };
}
