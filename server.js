const puppeteer = require('puppeteer');
const express = require('express');

const server = express();

server.get('/', async (request, response) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://cursos.alura.com.br/user/wagnerfaria1601');

    await page.setViewport({ width: 1080, height: 1024 });

    const pageContent = await page.evaluate(() => {
        return Array
            .from(document.querySelector('ul.profile-finishedCourses-list').children)
            .map(element => {
                return {
                    courseName: element.dataset.courseName,
                    startedAt: element.dataset.startedAt,
                    finishedAt: element.dataset.finishedAt,
                    categoryCode: element.dataset.categoryCode,
                    certificateLink: element.children[0].children[3].children[0].href.replace('certificate', 'formalCertificate')
                }
            });
    })


    let pageContentWithHours = [];

    for (let index = 0; index < pageContent.length; index++) {
        const curso = pageContent[index];
        await page.goto(curso.certificateLink);
        await page.setViewport({ width: 1080, height: 1024 });
        const certificateHour = await page.evaluate(() => {
            const words = document
                .querySelector('.certificate-details>span')
                .innerHTML
                .replaceAll('\n', '')
                .replaceAll('  ', '')
                .split(' ');
            var numberIndex = words.findIndex((word) => word === 'horária');
            const nextWord = words[numberIndex + 3];
            return nextWord
        });
        pageContentWithHours.push({ ...curso, certificateHour: Number(certificateHour) });
    }

    await browser.close();

    console.log('HORAS ACUMULADAS: ',pageContentWithHours.map(curso => curso.certificateHour).reduce((accumulator, currentValue) => accumulator + currentValue, 0));

    response.send(pageContentWithHours)
});

const port = 3000
server.listen(port, () => {
    console.log('Server up');
    console.log(`Acesse em https://localhost:${port}`);
});