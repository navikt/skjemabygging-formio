export class Backend {
  projectURL;
  constructor(projectURL, workingPath, giturl) {
    this.projectURL = projectURL;
  }
  async cloneRepo() {
    return null;
  }
  ho() {
    return {message: 'ho'};
  }

  getProjectURL() {
    return this.projectURL;
  }
}

