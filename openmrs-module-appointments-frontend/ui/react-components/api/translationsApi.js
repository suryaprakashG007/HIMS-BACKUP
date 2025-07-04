import axios from 'axios';
import {mergeObjects} from '../utils/MergeObjectUtil';
import {i18nConfigPath} from "../config";

const baseLocaleUrl = 'i18n/';

const loadFile = async (url) => {
    try {
        return await axios.get(url);
    } catch (e) {
        return;
    }
};

const loadBahmniTranslations = async (fileURL) => {
    return await loadFile(`${baseLocaleUrl}${fileURL}`);
};
const loadCustomTranslations = async (fileURL) => {
    const rootDirFromLocalStorage = localStorage.getItem('rootDir') || "";
    const customLocaleUrl = `${rootDirFromLocalStorage}${i18nConfigPath}`;
    return await loadFile(`${customLocaleUrl}${fileURL}`);
};

const mergeTranslations = function (bahmniTranslations, customTranslations, shouldMerge) {
    if (shouldMerge) {
        return mergeObjects(bahmniTranslations, customTranslations);
    }
    return [bahmniTranslations, customTranslations];
};

export const getTranslations = async ({appName, locale, shouldMerge = true}) => {
    const fileURL = `${appName}/locale_${locale}.json`;
    const bahmniTranslations = await loadBahmniTranslations(fileURL);
    const customTranslations = await loadCustomTranslations(fileURL);
    const messages = await mergeTranslations(bahmniTranslations && bahmniTranslations.data,
        customTranslations && customTranslations.data, shouldMerge);
    return messages;
};
