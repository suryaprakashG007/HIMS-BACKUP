# bahmni-carbon-ui

## Next Gen UI library for Bahmni

This is the UI component library for Bahmni and OpenMRS, built on top of Carbon Design system. <br/>
If any react component coming from Carbon library needs to be updated based on the requirements of Bahmni, it should be done here.<br/>
Example: Combobox component of Carbon by default does not filter the options based on the provided input text. <br/>
So, we have extended the Combobox component of Carbon library and added the filtering functionality as a default so that it can be used across Bahmni.

### Notes on local link

To use a local copy of this lib with your project run the following commands

```bash
cd <project dir>/node_modules/react
yarn link
cd ../react-dom
yarn link

cd <bahmni-carbon-ui dir>
yarn link
yarn link react
yarn link react-dom

cd <project dir>
yarn link bahmni-carbon-ui
```

### Debug changes
