import { Dispatch, SetStateAction, useState } from 'react';

const useModal = (initialMode: boolean = false): [boolean, Dispatch<SetStateAction<boolean>>, () => void] => {
  const [modalOpen, setModalOpen] = useState(initialMode);
  const toggle = () => setModalOpen(!modalOpen);
  return [modalOpen, setModalOpen, toggle];
};

export default useModal;
