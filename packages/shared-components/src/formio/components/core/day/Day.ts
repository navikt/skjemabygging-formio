// @ts-nocheck
import FormioDay from 'formiojs/components/day/Day';
import dayForm from './Day.form';

class Day extends FormioDay {
  static schema() {
    return FormioDay.schema({
      label: 'Mnd / år',
      type: 'day',
      key: 'manedAr',
      input: true,
      dataGridLabel: true,
      fieldSize: 'input--s',
      clearOnHide: true,
      fields: {
        day: {
          fieldSize: 'input--s',
          required: false,
          hide: true,
        },
        month: {
          fieldSize: 'input--s',
          type: 'select',
          placeholder: 'Måned',
          required: true,
        },
        year: {
          fieldSize: 'input--s',
          type: 'number',
          placeholder: 'År',
          required: true,
        },
      },
    });
  }

  static editForm() {
    const dayEditForm = dayForm();

    const tabComponents = dayEditForm.components.find((i) => i.key === 'tabs').components;
    const yearComponents = tabComponents.find((item) => item.key === 'year').components;
    return {
      ...dayEditForm,
      components: [
        ...dayEditForm.components.filter((i) => i.key !== 'tabs'),
        {
          key: 'tabs',
          type: 'tabs',
          components: [
            ...tabComponents.map((tab) => {
              if (tab.key === 'year')
                return {
                  key: 'year',
                  label: 'Year',
                  fieldSize: 'input--s',
                  components: [
                    ...yearComponents.map((component) => {
                      if (component.key === 'fields.year.minYear' || component.key === 'fields.year.maxYear') {
                        return {
                          ...component,
                          placeholder: '',
                        };
                      } else {
                        return component;
                      }
                    }),
                  ],
                };
              else return tab;
            }),
          ],
        },
      ],
    };
  }

  //Override default minYear and maxYear value
  inputDefinition(name) {
    let min, max;
    if (name === 'day') {
      min = 1;
      max = 31;
    }
    if (name === 'month') {
      min = 1;
      max = 12;
    }
    if (name === 'year') {
      min = this.component.fields?.year?.minYear ?? 1990;
      max = this.component.fields?.year?.maxYear ?? 2050;
    }
    return {
      type: 'input',
      ref: name,
      attr: {
        id: `${this.component.key}-${name}`,
        class: `form-control ${this.transform('class', `formio-day-component-${name}`)}`,
        type: this.component.fields[name].type === 'select' ? 'select' : 'number',
        placeholder: this.t(this.component.fields[name].placeholder),
        step: 1,
        min,
        max,
      },
    };
  }

  get months() {
    if (this._months) {
      return this._months;
    }
    this._months = [
      {
        value: '',
        label: this.component.fields?.month?.placeholder ?? this.hideInputLabels ? this.t('Måned') : '',
      },
      { value: 1, label: this.t('Januar') },
      { value: 2, label: this.t('Februar') },
      { value: 3, label: this.t('Mars') },
      { value: 4, label: this.t('April') },
      { value: 5, label: this.t('Mai') },
      { value: 6, label: this.t('Juni') },
      { value: 7, label: this.t('Juli') },
      { value: 8, label: this.t('August') },
      { value: 9, label: this.t('September') },
      { value: 10, label: this.t('Oktober') },
      { value: 11, label: this.t('November') },
      { value: 12, label: this.t('Desember') },
    ];
    return this._months;
  }
}

export default Day;
