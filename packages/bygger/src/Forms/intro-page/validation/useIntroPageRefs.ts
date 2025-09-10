import { RefObject, useRef } from 'react';

export interface IntroPageRefs {
  introduction: RefObject<HTMLDivElement>;
  'sections.prerequisites.title': RefObject<HTMLInputElement>;
  'sections.prerequisites.description': RefObject<HTMLTextAreaElement>;
  'sections.prerequisites.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.prerequisites.message': RefObject<HTMLDivElement>;
  'sections.dataTreatment.title': RefObject<HTMLTextAreaElement>;
  'sections.dataTreatment.description': RefObject<HTMLTextAreaElement>;
  'sections.dataTreatment.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.dataTreatment.message': RefObject<HTMLDivElement>;
  'sections.dataDisclosure.title': RefObject<HTMLInputElement>;
  'sections.dataDisclosure.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.scope.title': RefObject<HTMLInputElement>;
  'sections.scope.description': RefObject<HTMLTextAreaElement>;
  'sections.scope.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.scope.message': RefObject<HTMLDivElement>;
  'sections.outOfScope.title': RefObject<HTMLInputElement>;
  'sections.outOfScope.description': RefObject<HTMLTextAreaElement>;
  'sections.outOfScope.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.outOfScope.message': RefObject<HTMLDivElement>;
  'sections.automaticProcessing.description': RefObject<HTMLTextAreaElement>;
  'sections.automaticProcessing.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.automaticProcessing.message': RefObject<HTMLDivElement>;
  'sections.optional.title': RefObject<HTMLInputElement>;
  'sections.optional.description': RefObject<HTMLTextAreaElement>;
  'sections.optional.bulletPoints': RefObject<Array<HTMLTextAreaElement | null>>;
  'sections.optional.message': RefObject<HTMLDivElement>;
  'importantInformation.title': RefObject<HTMLInputElement>;
  'importantInformation.description': RefObject<HTMLTextAreaElement>;
  selfDeclaration: RefObject<HTMLInputElement>;
}

export function useIntroPageRefs() {
  return {
    introduction: useRef<HTMLDivElement>(null),
    'importantInformation.title': useRef<HTMLInputElement>(null),
    'importantInformation.description': useRef<HTMLTextAreaElement>(null),
    'sections.scope.title': useRef<HTMLInputElement>(null),
    'sections.scope.description': useRef<HTMLTextAreaElement>(null),
    'sections.scope.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.scope.message': useRef<HTMLDivElement>(null),
    'sections.outOfScope.title': useRef<HTMLInputElement>(null),
    'sections.outOfScope.description': useRef<HTMLTextAreaElement>(null),
    'sections.outOfScope.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.outOfScope.message': useRef<HTMLDivElement>(null),
    'sections.dataTreatment.title': useRef<HTMLTextAreaElement>(null),
    'sections.dataTreatment.description': useRef<HTMLTextAreaElement>(null),
    'sections.dataTreatment.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.dataTreatment.message': useRef<HTMLDivElement>(null),
    'sections.prerequisites.title': useRef<HTMLInputElement>(null),
    'sections.prerequisites.description': useRef<HTMLTextAreaElement>(null),
    'sections.prerequisites.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.prerequisites.message': useRef<HTMLDivElement>(null),
    'sections.dataDisclosure.title': useRef<HTMLInputElement>(null),
    'sections.dataDisclosure.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.automaticProcessing.description': useRef<HTMLTextAreaElement>(null),
    'sections.automaticProcessing.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.automaticProcessing.message': useRef<HTMLDivElement>(null),
    'sections.optional.title': useRef<HTMLInputElement>(null),
    'sections.optional.description': useRef<HTMLTextAreaElement>(null),
    'sections.optional.bulletPoints': useRef<Array<HTMLTextAreaElement | null>>([]),
    'sections.optional.message': useRef<HTMLDivElement>(null),
    selfDeclaration: useRef<HTMLInputElement>(null),
  };
}
